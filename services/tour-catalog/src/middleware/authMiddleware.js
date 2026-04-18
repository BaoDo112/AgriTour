const jwt = require('jsonwebtoken');


const authMiddleware = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    if (!token) {
        return res.status(401).json({ 
            message: 'Truy cập bị từ chối. Không tìm thấy mã xác thực.' 
        });
    }

    try {
      
        const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
        const decoded = jwt.verify(token, secret);

        req.user = decoded;
        
     
        next();
    } catch (err) {
      
        return res.status(403).json({ 
            message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' 
        });
    }
};


const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Bạn không có quyền thực hiện hành động này.' 
            });
        }
        next();
    };
};

module.exports = { authMiddleware, authorizeRole };