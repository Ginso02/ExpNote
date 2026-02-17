from itsdangerous import URLSafeTimedSerializer
from flask import current_app
from flask_mail import Message
from app import mail


def generate_reset_token(email: str) -> str:
    """生成密码重置令牌"""
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt='password-reset-salt')


def verify_reset_token(token: str, max_age: int = 3600) -> str | None:
    """
    验证密码重置令牌
    默认有效期 1 小时
    """
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=max_age)
        return email
    except Exception:
        return None


def send_reset_email(to_email: str, reset_url: str):
    """发送密码重置邮件"""
    msg = Message(
        subject='[ExpNote] 密码重置',
        recipients=[to_email],
        html=f'''
        <h2>ExpNote 密码重置</h2>
        <p>您收到此邮件是因为有人请求重置您的 ExpNote 账户密码。</p>
        <p>请点击下方链接重置密码（有效期 1 小时）：</p>
        <p><a href="{reset_url}">{reset_url}</a></p>
        <p>如果您没有请求重置密码，请忽略此邮件。</p>
        <br>
        <p>—— ExpNote 团队</p>
        ''',
    )
    mail.send(msg)
