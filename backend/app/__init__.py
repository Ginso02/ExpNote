from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail

from app.config import config_by_name

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()


def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # CORS - allow frontend origin
    CORS(app, resources={
        r"/api/*": {
            "origins": [app.config['FRONTEND_URL']],
            "supports_credentials": True,
        }
    })

    # JWT token blocklist (for logout)
    from app.models.token_blocklist import TokenBlocklist

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
        return token is not None

    # Register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from app.routes.user import user_bp
    app.register_blueprint(user_bp, url_prefix='/api/user')

    # Create tables
    with app.app_context():
        from app.models import user, token_blocklist  # noqa
        db.create_all()

    return app
