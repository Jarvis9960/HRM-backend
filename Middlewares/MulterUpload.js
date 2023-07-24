import multer from 'multer';
import path from 'path';

export const multerUpload = multer({
    storage: multer.diskStorage({
        destination:function(req, file, cb){
            cb(null, 'public/uploads')
        },
        filename:function(req, file, cb){
            cb(null, file.fieldname+ '_' + Date.now() + path.extname(file.originalname))
        }

    })
})