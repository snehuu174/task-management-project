import hashlib

class PasswordHelper:
    """
    This is methods for hashing and methods for hashing and verifying passwords using the SHA-256 algorithm.
    """
    @staticmethod
    def hash_password(password):
        password = password.encode('utf-8')
        hash_object = hashlib.sha256(password)
        return hash_object.hexdigest()
    
    @staticmethod
    def verify_password(password, hashed_password):
        if PasswordHelper.hash_password(password) == hashed_password:
            return True
        return False
    
    
PasswordHelperObj = PasswordHelper() # Creating an instance of the PasswordHelper class

