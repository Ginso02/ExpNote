from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)

from app import db
from app.models.user import User
from app.models.token_blocklist import TokenBlocklist
from app.utils.validators import validate_email, validate_password, validate_username
from app.utils.email import generate_reset_token, verify_reset_token, send_reset_email

auth_bp = Blueprint('auth', __name__)


# ──────────────────────────────────────────────
# 注册
# ──────────────────────────────────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': '请提供注册信息'}), 400

    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # ---- 校验 ----
    ok, msg = validate_username(username)
    if not ok:
        return jsonify({'error': msg}), 400

    if not validate_email(email):
        return jsonify({'error': '邮箱格式不正确'}), 400

    ok, msg = validate_password(password)
    if not ok:
        return jsonify({'error': msg}), 400

    # 唯一性校验
    if User.query.filter_by(email=email).first():
        return jsonify({'error': '该邮箱已被注册'}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({'error': '该用户名已被使用'}), 409

    # ---- 创建用户 ----
    user = User(username=username, email=email, role='user')
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # 注册成功直接签发 token
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': '注册成功',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
    }), 201


# ──────────────────────────────────────────────
# 登录
# ──────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': '请提供登录信息'}), 400

    login_id = data.get('login_id', '').strip()  # 可以是邮箱或用户名
    password = data.get('password', '')

    if not login_id or not password:
        return jsonify({'error': '请输入用户名/邮箱和密码'}), 400

    # 尝试用邮箱或用户名查找
    user = User.query.filter(
        (User.email == login_id.lower()) | (User.username == login_id)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({'error': '用户名/邮箱或密码错误'}), 401

    if not user.is_active:
        return jsonify({'error': '该账户已被禁用'}), 403

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': '登录成功',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
    }), 200


# ──────────────────────────────────────────────
# 刷新 Token
# ──────────────────────────────────────────────
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'access_token': access_token}), 200


# ──────────────────────────────────────────────
# 退出登录（将当前 token 加入黑名单）
# ──────────────────────────────────────────────
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    db.session.add(TokenBlocklist(jti=jti, created_at=datetime.now(timezone.utc)))
    db.session.commit()
    return jsonify({'message': '已退出登录'}), 200


# ──────────────────────────────────────────────
# 修改密码（已登录用户）
# ──────────────────────────────────────────────
@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.get_json()
    if not data:
        return jsonify({'error': '请提供密码信息'}), 400

    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'error': '用户不存在'}), 404

    if not user.check_password(old_password):
        return jsonify({'error': '原密码错误'}), 400

    ok, msg = validate_password(new_password)
    if not ok:
        return jsonify({'error': msg}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': '密码修改成功'}), 200


# ──────────────────────────────────────────────
# 忘记密码 —— 发送重置邮件
# ──────────────────────────────────────────────
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email', '').strip().lower() if data else ''

    if not email:
        return jsonify({'error': '请输入邮箱'}), 400

    user = User.query.filter_by(email=email).first()

    # 不管用户是否存在，统一返回同样的消息（防止枚举）
    if user:
        from flask import current_app
        token = generate_reset_token(email)
        reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={token}"
        try:
            send_reset_email(email, reset_url)
        except Exception:
            return jsonify({'error': '邮件发送失败，请稍后再试'}), 500

    return jsonify({'message': '如果该邮箱已注册，重置链接已发送至您的邮箱'}), 200


# ──────────────────────────────────────────────
# 重置密码（通过邮件链接中的 token）
# ──────────────────────────────────────────────
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    if not data:
        return jsonify({'error': '请提供重置信息'}), 400

    token = data.get('token', '')
    new_password = data.get('new_password', '')

    if not token:
        return jsonify({'error': '重置令牌无效'}), 400

    email = verify_reset_token(token)
    if not email:
        return jsonify({'error': '重置链接已过期或无效'}), 400

    ok, msg = validate_password(new_password)
    if not ok:
        return jsonify({'error': msg}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': '用户不存在'}), 404

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': '密码重置成功，请重新登录'}), 200
