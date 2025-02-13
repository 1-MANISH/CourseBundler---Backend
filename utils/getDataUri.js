import DataUriParser from "datauri/parser.js"
import path from "path"

const getDataUri = async(file)=>{
    const parser = new DataUriParser()
    const extensionOfPath = path.extname(file.originalname).toString()
    const baseFile = parser.format(extensionOfPath,file.buffer)
    return baseFile
}

const getNotesUris = async (notesFiles) => {
    const notesUris = []
    notesFiles?.forEach(async (note)=>{
        notesUris.push(await getDataUri(note))
    })
    return notesUris
}

export {
    getDataUri,
    getNotesUris
}
