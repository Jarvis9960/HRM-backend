import mongoose from "mongoose"

const adminSchema = new mongoose.Schema(
    {
        first_name :{
                type: String,
                required:true
        },
        last_name :{
                type: String,
                required:true
        },
        email :{
                type: String,
                required:true,
                unique: true
        },
        password :{
                type: String,
                required:true,
                minlength: 8
        },
    },
    { timestamps: true  }
    )

    const AdminModel = mongoose.model("Admin", adminSchema)
    export default AdminModel