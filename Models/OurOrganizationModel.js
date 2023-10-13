import mongoose from "mongoose";

const ourOrganizationSchema = new mongoose.Schema({
    LegalName: {
        type: String,
        required: true
    },
    GST: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    }
})

const ourOrganizationModel = mongoose.model("ourOrgnaization", ourOrganizationSchema);


export default ourOrganizationModel;