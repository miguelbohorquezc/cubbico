import { createSlice } from "@reduxjs/toolkit";
import { studentInfo } from "../../models";

const initialState: studentInfo = {
  id: "",
  document: "",
  name: "",
  lastName: "",
  classRoom: "",
  className: "",
  caracter: ""
};

const studentFormSlice = createSlice({
  name: "studentForm",
  initialState,
  reducers: {
    setStudentForm: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { setStudentForm } = studentFormSlice.actions;

export default studentFormSlice.reducer;
