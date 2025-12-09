import sympy as sp

def solve_ode(data):
    x = sp.symbols('x')
    y = sp.Function('y')(x)

    ode_type = data.get("type")

    if ode_type == "first":
        subtype = data.get("subtype")
        if subtype == "linear":
            p = sp.sympify(data.get("p", "0"))
            q = sp.sympify(data.get("q", "0"))
            ode = sp.Eq(sp.Derivative(y, x) + p*y, q)
        elif subtype == "separable":
            f = sp.sympify(data.get("f", "0"))
            g = sp.sympify(data.get("g", "1"))
            ode = sp.Eq(sp.Derivative(y, x), f / g)
        else:
            return {"error": "Invalid first-order subtype"}
        solution = sp.dsolve(ode, y)
        return {"solution": str(solution)}

    elif ode_type == "second":
        a = sp.sympify(data.get("a", "1"))
        b = sp.sympify(data.get("b", "0"))
        c = sp.sympify(data.get("c", "0"))
        r = sp.sympify(data.get("r", "0"))
        ode = sp.Eq(a*sp.Derivative(y, x, 2) + b*sp.Derivative(y, x) + c*y, r)
        solution = sp.dsolve(ode, y)
        return {"solution": str(solution)}

    return {"error": "Invalid ODE type"}
