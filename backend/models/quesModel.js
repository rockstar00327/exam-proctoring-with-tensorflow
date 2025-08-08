import mongoose from "mongoose";

const questionSchema = mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      reuqired: true,
    },
    subject: {
      type: String,
    },
    topic: {
      type: String,
    },
    difficulty: {
      type: String,
    },
    multiOptions: [
      {
        optionText: {
          type: String,
        },
        isCorrect: {
          type: Boolean,
        },
      },
    ],
    selectedOneValue: {
      type: String,
    },
    singleWordAnswers: {
      type: [String],
    },
    essay: {
      type: String,
    },
    examId: {
      type: String, // Use the same data type (String) as in the exam model
      required: true, // You can make examId required if it's always present
    },
    mark: {
      type: Number,
      default: 1,
    },
    negativeMark: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: String,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
