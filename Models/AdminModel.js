import mongoose from "mongoose"

const AdminSchema = new mongoose.Schema(
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
        role: {
            type: String,
            required: true,
            default: "Admin"
        },
    },
    { timestamps: true  }
    )

    const AdminModel = mongoose.model("Admin", AdminSchema)
    export default AdminModel