// import Category from "./category";

// export default interface UserTask {
//   id?: string;
//   title: string;
//   itsDone: boolean;
//   description: string | null;
//   dueTime: Date;
//   priority: string;
//   createdAt: Date;
//   category?: Category;
// }


// interfaces/task.ts
export interface UserTask {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  dueTime: string;
  createdAt: string;
  itsDone: boolean;
  category?: {
    name?:string;
    color?: string;
    icon?: React.ReactNode;
  };
}

 
