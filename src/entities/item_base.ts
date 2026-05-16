import { AppPageId } from "../types/app";

export interface navbarItem {
  id: string;
  name: string;
  value: AppPageId;
};

export interface itemBase{
 id: string;
 name:string;
 value?:string;
}

export interface itemInfoBase extends itemBase{
    description: string;
}