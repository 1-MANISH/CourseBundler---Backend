import DataUriParser from "datauri/parser.js"
import path from "path"

const getDataUri = (file)=>{
    const parser = new DataUriParser()
    const extensionOfPath = path.extname(file.originalname).toString()
    const baseFile = parser.format(extensionOfPath,file.buffer)
    return baseFile
}

export {
    getDataUri
}
