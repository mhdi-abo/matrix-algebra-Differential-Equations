import numpy as np
import sympy as sp

def ref(matrix):
    try:
        M = sp.Matrix(matrix)
        return M.echelon_form().tolist()
    except Exception as e:
        print("Invalid matrix:", e)
        return None

def rref(matrix):
    try:
        M = sp.Matrix(matrix)
        rref_mat = M.rref()
        return rref_mat.tolist()
    except Exception as e:
        print("Invalid matrix:", e)
        return None


def Linear_independence(matrix):
    M = np.array(matrix, dtype=float)
    return np.linalg.matrix_rank(M) == M.shape[1]

def row_space(matrix):
    try:
        M = sp.Matrix(matrix)
        rows = M.rowspace()
        return [list(row) for row in rows]
    except Exception as e:
        print("Invalid Input:", e)
        return None


def col_space(matrix):
    try:
        M = sp.Matrix(matrix)
        cols = M.columnspace()
        return [list(col) for col in cols]
    except Exception as e:
        print("Invalid Input:", e)
        return None

def Diagonalize(matrix):
    M = sp.Matrix(matrix)
    P, D = M.diagonalize()
    verification = P * D * P.inv()
    return P.tolist(), D.tolist(), verification.tolist()


def cramers_rule(matrix):
    M = np.array(matrix, dtype=float)
    rows, cols = M.shape
    if cols != rows + 1:
        raise ValueError("Augmented matrix required")

    A, b = M[:, :-1], M[:, -1]
    det_A = np.linalg.det(A)
    if np.isclose(det_A, 0):
        raise ValueError("No unique solution")

    solution = []
    for i in range(rows):
        Ai = A.copy()
        Ai[:, i] = b
        solution.append(float(np.linalg.det(Ai) / det_A))

    return solution

def matrix_inverse(matrix):
    return sp.Matrix(matrix).inv().tolist()

def matrix_rank(matrix):
    return int(sp.Matrix(matrix).rank())


def matrix_multiplication(A, B):
    return (sp.Matrix(A) * sp.Matrix(B)).tolist()

def matrix_addition(A, B):
    return (sp.Matrix(A) + sp.Matrix(B)).tolist()

def matrix_subtraction(A, B):
    return (sp.Matrix(A) - sp.Matrix(B)).tolist()

def transpose(matrix):
    return sp.Matrix(matrix).T.tolist()
