import re


def validate_email(email: str) -> bool:
    """校验邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str) -> tuple[bool, str]:
    """
    校验密码强度（MVP 简单版本）
    - 至少 6 位
    - 至少包含一个字母和一个数字
    """
    if len(password) < 6:
        return False, '密码长度至少为 6 位'
    if not re.search(r'[a-zA-Z]', password):
        return False, '密码至少包含一个字母'
    if not re.search(r'\d', password):
        return False, '密码至少包含一个数字'
    return True, ''


def validate_username(username: str) -> tuple[bool, str]:
    """
    校验用户名
    - 3-30 个字符
    - 只允许字母、数字、下划线、中文
    """
    if len(username) < 3 or len(username) > 30:
        return False, '用户名长度为 3-30 个字符'
    if not re.match(r'^[\w\u4e00-\u9fa5]+$', username):
        return False, '用户名只能包含字母、数字、下划线和中文'
    return True, ''
