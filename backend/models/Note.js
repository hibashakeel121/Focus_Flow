import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, default: '', maxlength: 100000 },
}, { timestamps: true });

noteSchema.set('toJSON', {
  transform(_document, result) {
    result.id = result._id.toString();
    delete result._id;
    delete result.__v;
    return result;
  },
});

export default mongoose.model('Note', noteSchema);
