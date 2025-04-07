import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ChangeEvent, FocusEvent } from "react";


export interface studentFormComponentState{
    studentForm : ComponentInput[]
}

export interface ComponentInput {
    order: string;
    id: string;
    type: string;
    name: string;
    value: string;
    img: string;
    onBlur: (Event: FocusEvent<HTMLSelectElement> | FocusEvent<HTMLInputElement>) => void;
    onChange: (Event: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    textError: string;
    option?: []
    className: string;
    textStyle: string;
}

interface CreateComponents {
    payload: ComponentInput[];
    type: string;
}

export const studentFormSlice = createSlice({
    name: 'studentFormComponent',
    initialState: {
        studentForm: [],
    } as studentFormComponentState,
    reducers: {
        createStudentForm: (state, action: PayloadAction<CreateComponents['payload']>) =>{
            state.studentForm = [...state.studentForm, ...action.payload]
        }
    }
});

export const {createStudentForm} = studentFormSlice.actions
export default studentFormSlice.reducer