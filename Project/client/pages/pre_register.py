from flask import render_template, request
import requests

def pre_register_page():
    return render_template('pre_register.html')

def pre_register_api():
    name = request.form['name']
    securityLevel = request.form['securityLevel']

    try:
        response = requests.post('http://localhost:3000/preregister', json={'fullName': name, 'securityLevel': securityLevel})
        success = response.status_code == 200      
        
        return render_template('pre_register.html', status = {
                'code': 'success' if success else 'error', 
                'message': 'Pre-registered successfully!' if success else response.json()['error']
            }, 
            response = response.json()
        )
    except:
        return render_template('pre_register.html', status={'code': 'error', 'message': 'Server response not found'})
