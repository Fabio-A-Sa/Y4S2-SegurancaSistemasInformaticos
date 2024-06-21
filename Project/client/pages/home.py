from flask import render_template, session

def home_page():
    if 'id' in session: # is logged in
        return render_template('home.html', username=session['username'], security_level=session['security_level'])
    return render_template('index.html')
