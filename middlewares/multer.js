import multer from "multer";

const storage = multer.memoryStorage()

const multerUpload = multer({
    storage,
    limits:{
        fileSize:100*1024*1024 // 100mb | [ 1mb = 1024kb , 1kb = 1024 bytes]
    }
})

const singleUpload = multerUpload.single("file")

const multipleUpload = multerUpload.fields([
    {name:"video",maxCount:1},
    {name:"notes",maxCount:5}
])

export {
    multerUpload,
    singleUpload,
    multipleUpload
}