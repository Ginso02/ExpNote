from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User

user_bp = Blueprint('user', __name__)


@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """获取当前用户信息"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    return jsonify({'user': user.to_dict()}), 200
