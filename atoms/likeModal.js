import { atom } from "recoil";

export const likeModal = atom({
    key: 'likeModal',
    default: false
})

export const likeModalBoxData = atom({
    key: 'likeModalBoxData',
    default: null
})