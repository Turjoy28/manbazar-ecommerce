import { Ui } from "../../models/ui.model"
import { IUI } from "../../types";

const getUiData = async()=>{
    const result = await Ui.find();
    return result;
}


const updateUiData = async(id: string, payload: IUI)=>{
    const result = await Ui.findByIdAndUpdate(id, {$set: payload}, {new: true});
    return result;
}


export const uiService = {
    getUiData,
    updateUiData
}