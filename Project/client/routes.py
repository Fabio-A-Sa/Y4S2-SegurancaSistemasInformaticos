from flask import Blueprint, request, session, redirect
from pages.pre_register import pre_register_page, pre_register_api
from pages.register import register_page, register_api
from pages.login import login_page, login_api
from pages.home import home_page
from pages.users import users_api
from pages.operations import service_api
from pages.chat import chat_setup_api, chat_sendmessage, chat_receivemessage, chat_listmessages
from utils import init_nonce

routes = Blueprint('routes', __name__)

@routes.before_app_request
def initialize():
    init_nonce()

@routes.route('/')
def home():
    return home_page()

@routes.route('/pre-register', methods=['GET', 'POST'])
def pre_register():
    if request.method == 'POST':
        return pre_register_api()
    return pre_register_page()

@routes.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        return register_api()
    return register_page()

@routes.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return login_api()
    return login_page()

@routes.route('/logout', methods=['POST'])
def logout():
    session.pop('id')
    return redirect('/')

@routes.route('/operation/<op>', methods=['POST'])
def operation(op):
    return service_api(op)

def register_routes(app):
    app.register_blueprint(routes)

@routes.route('/users', methods=['GET', 'POST'])
def users():
    return users_api()

@routes.route('/chat', methods=['GET', 'POST'])
def chat():
    return chat_setup_api()

@routes.route('/sendmessage', methods=['GET', 'POST'])
def sendmessage():
    return chat_sendmessage()   

@routes.route('/receivemessage', methods=['POST'])
def receivemessage():
    if request.method == 'POST':
        return chat_receivemessage()

    else: return "message"      

@routes.route('/messages', methods=['GET'])
def messages():
    return chat_listmessages()