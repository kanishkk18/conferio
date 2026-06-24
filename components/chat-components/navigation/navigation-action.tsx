"use client";

import React from "react";
import { Plus } from "lucide-react";
import { ActionTooltip } from "@/components/chat-components/action-tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { FileUpload } from "@/components/chat-components/file-upload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/animated-modal';

const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required." }),
  imageUrl: z.string().min(1, { message: "Server image is required." })
});

export function NavigationAction() {
  const { push } = useRouter()
  const { refresh } = useRouter()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: ""
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/servers", values);
      form.reset();
      setIsDialogOpen(false); // Close dialog on success
      
      if (response.data?.id) {
        push(`/servers/${response.data.id}`);
      } else {
        refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Reset form when dialog closes
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      form.reset();
    }
  };

  return (
    <div>
      <ActionTooltip side="right" align="end" label="Add a server">
        <Modal open={isDialogOpen} onOpenChange={handleDialogChange}>
          <ModalTrigger className="!px-0">
            <button type="button" className="group flex items-center">
              <div className="flex mx-3 h-[42px] w-[42px] rounded-xl border dark:border-[#191919] group-hover:rounded-2xl transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-blue-600">
                <Plus
                  className="group-hover:text-blue-600 transition rounded-full bg-white text-black"
                  size={22}
                />
              </div>
            </button>
          </ModalTrigger>
          <ModalBody className=" !max-w-[32%] !min-h-[48%] !h-[52%] !max-h-[70%] !w-[20%]">

          <ModalContent className="!px-6 space-y-5 pb-0">
            <div className="pt-4 px-6 flex flex-col gap-2 text-center sm:text-left">
              <h1 className="text-2xl text-center font-semibold leading-none ">
             Create ChatSpace
              </h1>
              <p className="text-center text-zinc-500 text-muted-foreground text-sm">
                Give your chatspace a personality with a name and an image. You can
                always change it later.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                <div className="pt-2 px-6 flex justify-center items-center">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FileUpload
                              endpoint="serverImage"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <ModalFooter className="!justify-center rounded-lg gap-2 !flex !items-center !w-full py-4">

                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className=" w-full">
                        {/* <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                          Chatspace Name
                        </FormLabel> */}
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            placeholder="Enter space name"
                            className="bg-transparent border !w-full !flex-1 !min-w-full focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    variant="default"
                    className=""
                  >
                    {isLoading ? "Creating..." : "Create"}
                  </Button>
                  </ModalFooter>
              </form>
            </Form>
          </ModalContent>
          </ModalBody>
        </Modal>
      </ActionTooltip>
    </div>
  );
}
