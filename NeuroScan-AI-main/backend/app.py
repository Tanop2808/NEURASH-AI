from flask import Flask
from flask_cors import CORS
from routes.health_routes import health_bp
from routes.prediction_routes import prediction_bp
from routes.auth_routes import auth_bp
from routes.report_routes import report_bp
from routes.chat_routes import chat_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(health_bp)
app.register_blueprint(prediction_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(report_bp)
app.register_blueprint(chat_bp)

if __name__ == '__main__':
    app.run(debug=True)