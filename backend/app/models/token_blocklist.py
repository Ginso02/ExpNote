from datetime import datetime, timezone
from app import db


class TokenBlocklist(db.Model):
    """JWT Token 黑名单，用于退出登录"""
    __tablename__ = 'token_blocklist'

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
