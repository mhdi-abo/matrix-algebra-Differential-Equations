from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import numpy as np
from datetime import timedelta
from mat_algebra import *
from Differential_Equations import solve_ode
import sympy as sp

app = Flask(__name__)
CORS(app)
app.secret_key = 'linear-algebra-tool-secret-key'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)

@app.before_request
def make_session_permanent():
    session.permanent = True

def serialize(obj):
    """
    Recursively convert numpy and sympy objects to JSON-serializable native Python types.
    - numpy arrays -> lists
    - numpy scalar -> python scalar
    - sympy Matrix -> lists
    - sympy numbers -> int/float
    - other sympy expressions -> str
    """

    if obj is None:
        return None
    if isinstance(obj, (bool, int, float, str)):
        return obj

  
    if isinstance(obj, np.ndarray):
        return serialize(obj.tolist())
    if isinstance(obj, np.generic):
        return obj.item()

 
    if isinstance(obj, list) or isinstance(obj, tuple):
        return [serialize(x) for x in obj]
    if isinstance(obj, dict):
        return {k: serialize(v) for k, v in obj.items()}

  
    try:
        if isinstance(obj, sp.Matrix):
            return serialize(obj.tolist())
    except Exception:
        pass

    
    try:
        if isinstance(obj, sp.Basic):
           
            try:
                if obj.is_Number:
                    val = obj.evalf()
                    
                    try:
                        ival = int(val)
                        if float(ival) == float(val):
                            return ival
                    except Exception:
                        pass
                    return float(val)
            except Exception:
                pass
            
            return str(obj)
    except Exception:
        pass

    try:
        return float(obj)
    except Exception:
        try:
            return int(obj)
        except Exception:
            return str(obj)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/ode")
def ode_page():
    return render_template("Differential_Equations.html")


@app.route("/calculate", methods=["POST"])
def calculate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        operation = data.get("operation")
        saved = data.get("saved_matrices", []) 
        primary_index = data.get("primary_index", 0)
        secondary_index = data.get("secondary_index", None)
        scalar = data.get("scalar", None)

        if operation is None:
            return jsonify({"error": "No operation specified"}), 400
        if not saved or len(saved) == 0:
            return jsonify({"error": "No matrices provided"}), 400
       
        if primary_index is None or primary_index < 0 or primary_index >= len(saved):
            primary_index = 0

        mats = [np.array(m, dtype=float) for m in saved]

       
        A = mats[primary_index]

        result = None

        if operation in ["add", "subtract", "multiply", "cramer"]:
            if secondary_index is None:
                return jsonify({"error": f"Operation {operation} requires a second matrix selection"}), 400
            if secondary_index < 0 or secondary_index >= len(mats):
                return jsonify({"error": "Invalid secondary matrix index"}), 400
            B = mats[secondary_index]

            if operation == "add":
                if A.shape != B.shape:
                    return jsonify({"error": "Matrices must have same shape for addition"}), 400
                result = A + B
            elif operation == "subtract":
                if A.shape != B.shape:
                    return jsonify({"error": "Matrices must have same shape for subtraction"}), 400
                result = A - B
            elif operation == "multiply":
                if A.shape[1] != B.shape[0]:
                    return jsonify({"error": "Invalid shapes for multiplication (A.cols != B.rows)"}), 400
                result = np.dot(A, B)
            elif operation == "cramer":
               
                try:
                   
                    result = cramers_rule(A.tolist())
                except Exception as e:
                    return jsonify({"error": f"Cramer's rule error: {str(e)}"}), 400

        elif operation == "scalar_multiply":
            if scalar is None:
                return jsonify({"error": "Scalar value required for scalar multiplication"}), 400
            try:
                s = float(scalar)
            except Exception:
                return jsonify({"error": "Invalid scalar value"}), 400
            result = A * s

        else:

            if operation == "det":
                if A.shape[0] != A.shape[1]:
                    return jsonify({"error": "Matrix must be square for determinant"}), 400
                result = float(np.linalg.det(A))
            elif operation == "inverse":
                if A.shape[0] != A.shape[1]:
                    return jsonify({"error": "Matrix must be square for inverse"}), 400
                try:
                    result = np.linalg.inv(A)
                except np.linalg.LinAlgError:
                    return jsonify({"error": "Matrix is singular, cannot invert"}), 400
            elif operation == "transpose":
                result = A.T
            elif operation == "rank":
                result = int(np.linalg.matrix_rank(A))
            elif operation == "eigen":
                if A.shape[0] != A.shape[1]:
                    return jsonify({"error": "Matrix must be square for eigen"}), 400
                vals, vecs = np.linalg.eig(A)
                result = {"values": vals, "vectors": vecs}
            elif operation == "rref":
                result = rref(A.tolist())
            elif operation == "ref":
                result = ref(A.tolist())
            elif operation == "linear_independence":
                result = bool(Linear_independence(A))
            elif operation == "row_space":
                result = row_space(A.tolist())
            elif operation == "col_space":
                result = col_space(A.tolist())
            elif operation == "diagonalize":
                try:
                    P, D, V = Diagonalize(A.tolist())
                    result = {"P": P, "D": D, "Verification": V}
                except Exception as e:
                    return jsonify({"error": f"Diagonalize error: {str(e)}"}), 400
            elif operation == "cramer":
                try:
                    result = cramers_rule(A.tolist())
                except Exception as e:
                    return jsonify({"error": f"Cramer's rule error: {str(e)}"}), 400
            else:
                return jsonify({"error": f"Unknown operation: {operation}"}), 400

        return jsonify({"operation": operation, "result": serialize(result)})

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route("/solve_ode", methods=["POST"])
def solve_ode_route():
    try:
        data = request.get_json()
        result = solve_ode(data)
      
        return jsonify(serialize(result))
    except Exception as e:
        return jsonify({"error": f"ODE solver error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
