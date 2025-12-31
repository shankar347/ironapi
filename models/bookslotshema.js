import mongoose from "mongoose";

const BookslotSchema = new mongoose.Schema({
    isOpen: {
        type: Boolean,
        default: true,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: String,
        default: "system"
    }
}, { timestamps: true });

const Bookslot = mongoose.model('Bookslot', BookslotSchema);

export default Bookslot;