from flask import Flask, jsonify, request
from flask_cors import CORS
from vm_controllers import User
from auth_controller import VMAuth

app = Flask(__name__)
CORS(app)


@app.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT token

    Expects JSON payload with 'username' and 'password'
    """
    json_data = request.get_json()
    username = json_data.get("username")
    password = json_data.get("password")
    auth = VMAuth()
    try:
        token = auth.authenticate(username, password)
        return (
            jsonify({"login_status": "success", "username": username, "token": token}),
            200,
        )
    except RuntimeError:
        print(f"username: {username}" f"password: {password}")
        return jsonify({"login_status": "fail", "message": "Invalid credentials"}), 401


def get_username_from_token():
    """Extract username from JWT token in Authorization header

    Returns username if token is valid, else None
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return None
    auth = VMAuth()
    valid, payload = auth.validate_token(token)
    if valid and "username" in payload:
        return payload["username"]
    return None


@app.route("/whoami")
def whoami_sw_user():
    """Returns User information for the user in the session

    Expects JWT token in Authorization header
    """
    username = get_username_from_token()
    if not username:
        return jsonify({"error": "User not authenticated"}), 401
    user = User.load_user(username)
    if user:
        return jsonify({"username": user.whoami()})
    return jsonify({"error": "User not found" f"{user}"}), 404


@app.route("/validate", methods=["POST"])
def validate_token():
    """Validates a JWT token

    Expects JSON payload with 'token'

    Returns True if the token is valid, else False
    """
    token = request.json.get("token", None)
    if token is None:
        return jsonify({"token_validated": False}), 401
    auth = VMAuth()
    valid, payload_or_error = auth.validate_token(token)
    if valid:
        return jsonify({"token_validated": True}), 200
    else:
        return jsonify({"token_validated": False, "exception": payload_or_error}), 401


@app.route("/vms_by_user")
def list_of_vms():
    """Returns Cluster information for the user in the session

    Expects JWT token in Authorization header

    """
    username = get_username_from_token()
    if not username:
        return jsonify({"error": "User not authenticated"}), 401
    user = User.load_user(username)
    if user:
        return user.vms_user()
    return jsonify({"error": "User not found"}), 404


@app.route("/vms/<int:vm_id>")
def get_vm(vm_id: int):
    """Returns VM information given a VM ID"""
    vm = User.get_vm(vm_id=vm_id)
    if vm:
        return jsonify(vm)
    return jsonify({"error": f"VM {vm_id} not found"}), 404


@app.route("/vms/all")
def vm_list():
    """Returns Cluster for every deployed cluster"""
    return User.get_all_vms()


@app.route("/vms/delete/<int:cluster>")
def vm_cluster_delete(cluster: int):
    """Deletes a cluster given an ID

    Expects JWT token in Authorization header

    Returns True if the deletion was successful, else False

    """
    username = get_username_from_token()
    if not username:
        return jsonify({"error": "User not authenticated"}), 401
    result = User.delete_vm(username=username, vm_id=cluster)
    if result:
        return jsonify({"success": True}), 200
    else:
        return jsonify({"error": "Delete failed"}), 400


if __name__ == "__main__":
    app.run()
