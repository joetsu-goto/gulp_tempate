import Unsei from "../../../json/unsei.json";

const unsei: string[] = Unsei.unsei;

// 結果
export let kekka = (): string => {
    let nmb: number = Math.floor(Math.random() * unsei.length );
    return unsei[nmb]; 
}