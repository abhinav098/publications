const mongoose = require('mongoose');

const { Schema } = mongoose;
const { nanoid } = require('nanoid');

const publicationSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => nanoid(),
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    id: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      index: true,
    },
    abstract: {
      type: String,
      index: true,
    },
    category: {
      type: String,
    },
    authors: {
      type: Array,
    },
    file_s3: {
      type: String,
    },
    image_s3: {
      type: String,
    },
    publication_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

publicationSchema.index({ title: 'text', abstract: 'text', text: 'text' });

publicationSchema.pre('save', function (next) {
  if (this.isNew) this.abstract = this.get('abstract') && this.get('abstract').replace(/(<([^>]+)>)/gi, '');
  next();
});

publicationSchema.pre('save', function (next) {
  if (this.isNew) {
    const publicationDate = this.get('publication_date');
    if (publicationDate) {
      try {
        this.publication_date = new Date(publicationDate);
      } catch (e) {
        this.publication_date = this.get('publication_date');
      }
    }
  }
  next();
});

module.exports = mongoose.model('Publication', publicationSchema);
