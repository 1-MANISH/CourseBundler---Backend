import cloudinary from "cloudinary"

const uploadFilesToCloudinary = async (files=[])=>{

    const uploadPromise = []

    files?.forEach((file)=>{
        const fileUploadPromise = cloudinary.v2.uploader.upload(
            file.content,
            {
                resource_type:"auto",
                folder:"CourseBundlerAllFiles"
            }
        )
        uploadPromise.push(fileUploadPromise)
    })

    try {
        const results = await Promise.all(uploadPromise)
        const formateResults = results.map((result)=>{
            return {
                publicId:result.public_id,
                url:result.secure_url
            }
        })
        return formateResults
    } catch (error) {
        throw new Error("Error uploading files to cloudinary",error)
    }
}

const deleteFilesFromCloudinary = async (publicIds = [])=>{

    if(publicIds.length === 0){
        throw new Error("No public IDs provided for deletion")
    }

    const deletePromise = []
    publicIds.forEach((publicId)=>{
        const deleteFilePromise = cloudinary.v2.uploader.destroy(publicId)
        deletePromise.push(deleteFilePromise)
    })

    try {
        const results = await Promise.all(deletePromise)
        const formateResults = results.map((result,index)=>{
            return {
                publicId:publicIds[index],
                result
            }
        })
        return formateResults
    } catch (error) {
        throw new Error("Error deleting images from Cloudinary", error);
    }
}
export {
    uploadFilesToCloudinary,
    deleteFilesFromCloudinary
}