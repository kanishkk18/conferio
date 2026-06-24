'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, Settings, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Search, SearchIcon } from '@/components/animate-ui/icons/search';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/animated-modal';
import { TaskForm } from '@/components/tasks/task-form';
import { PlusIcon } from '@/components/animate-ui/icons/plus';
import { Separator } from '@/components/ui/separator';
import DynamicIslandDemo from '@/components/ui/DynamicIslandDemo';
import UserComponent from '@/components/ui/comp-377';
import { Sparkles } from '@/components/animate-ui/icons/sparkles';
import Mainsidebar from '@/components/ui/mainSideBar';
import { Header } from '@/components/doc-components/Header';
import { redirect } from 'next/navigation';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  memberships: Array<{
    role: string;
  }>;
  _count: {
    pages: number;
    memberships: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

 if (status === 'unauthenticated') {
    redirect('/auth/login');
  }
  
  useEffect(() => {
    if (session) {
      fetchWorkspaces();
    }
  }, [session, status, router]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (error) {
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/workspaces/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const workspace = await response.json();
        toast.success('Workspace created successfully');
        setCreateOpen(false);
        setFormData({ name: '', description: '' });
        router.push(`/workspace/${workspace.id}`);
      } else {
        throw new Error('Failed to create workspace');
      }
    } catch (error) {
      toast.error('Failed to create workspace');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen dark:bg-black'>
      <Mainsidebar />
      <div className="w-full relative group ">
        {workspaces.length > 0 ? (
          <>
            <div className="z-[9999]">
              <Header />
              <div className="flex dark:bg-[#080808] items-center justify-between px-4 py-1 border-b dark:border-[#1C1C1C]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">Doc_Space</span>
                  </div>
                </div>

                <div className="flex justify-center items-center gap-2">
                  <AnimateIcon animateOnHover>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-transparent dark:border-[#262626] text-foreground hover:bg-muted rounded-lg"
                    >
                      <SearchIcon className="w-3.5 h-3.5" />
                      <Input
                        placeholder="Search Docs"
                        className="border-none w-fit h-8 dark:outline-none shadow-none p-0 select-none focus:ring-0 focus:outline-none bg-transparent"
                      />
                    </Button>
                  </AnimateIcon>

                  <Modal>
                    <ModalTrigger className="!h-fit p-0">
                      <Button
                        size="sm"
                        className="py-0 gap-1 h-8 dark:bg-white bg-[#1C1C1C] text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus/>
                        <span className="text-sm font-medium dark:text-black text-white">
                          New
                        </span>
                      </Button>
                    </ModalTrigger>

                    <ModalBody className=" !py-0 !max-w-[28%] !min-h-[35%] !h-[35%] !max-h-[35%]">
                      <form onSubmit={createWorkspace} className="w-full">
                        <ModalContent className="!py-0 !px-2">
                          <div className="flex flex-col gap-2 p-2 pt-4 h-fit text-center sm:text-left">
                            <h1 className="text-lg leading-none font-semibold">
                              Create New Workspace
                            </h1>
                            <p className="text-muted-foreground text-sm">
                              Set up a new workspace for your team collaboration.
                            </p>
                          </div>

                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="name" className="text-right">
                                Name
                              </Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({ ...formData, name: e.target.value })
                                }
                                className="col-span-3"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="description" className="text-right">
                                Description
                              </Label>
                              <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    description: e.target.value,
                                  })
                                }
                                className="col-span-3"
                                placeholder="Optional description"
                              />
                            </div>
                          </div>
                        </ModalContent>
                        <ModalFooter className="gap-4">
                          <Button type="submit" className='bg-[#6347EA] text-white'>Create Workspace</Button>
                        </ModalFooter>
                      </form>
                    </ModalBody>
                  </Modal>
                </div>
              </div>
            </div>

            <div className="w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 !z-[9999]">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 !z-[9999]">
                {workspaces.map((workspace) => (
                  <Card
                    key={workspace.id}
                    className="hover:shadow-lg dark:bg-[#111111] dark:border-[#222222] transition-shadow cursor-pointer z-[9999]"
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{workspace.name}</span>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                      {workspace.description && (
                        <CardDescription>{workspace.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {workspace._count.pages} pages
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {workspace._count.memberships} members
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

            </div>
          </>
        ) : (

          <div className="h-screen w-full relative !z-10">
            <div className="flex flex-col items-center justify-center py-24 text-center h-screen !z-[999]">
              <div className=" size-16  rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
                <svg className="size-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                </svg>
              </div>
              <p className="text-zinc-400 font-medium mb-1">No Docspaces yet</p>
              <p className="text-zinc-600 text-sm mb-6">Create your first Docspace</p>

              <Modal>
                <ModalTrigger className="!h-fit p-0">
                  <Button
                    size="sm"
                    className="h-[1.85rem] gap-1.5 bg-gradient-to-tr from-[#340eef] to-[#6347EA] text-primary-foreground hover:bg-primary/90"
                  >
                    <span className="text-sm font-medium text-white">
                      New Docspace
                    </span>
                    {/* <ChevronDown className="w-3.5 h-3.5" /> */}
                  </Button>
                </ModalTrigger>

                <ModalBody className=" !py-0 !max-w-[28%] !min-h-[35%] !h-[35%] !max-h-[35%]">
                  <form onSubmit={createWorkspace} className="w-full">
                    <ModalContent className="!py-0 !px-2">
                      <div className="flex flex-col gap-2 p-2 pt-4 h-fit text-center sm:text-left">
                        <h1 className="text-lg leading-none font-semibold">
                          Create New Workspace
                        </h1>
                        <p className="text-muted-foreground text-sm">
                          Set up a new workspace for your team collaboration.
                        </p>
                      </div>

                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Optional description"
                          />
                        </div>
                      </div>
                    </ModalContent>
                    <ModalFooter className="gap-4">
                      <Button type="submit" className='bg-[#6347EA] text-white'>Create Workspace</Button>
                    </ModalFooter>
                  </form>
                </ModalBody>
              </Modal>

            </div>
            <div className="absolute inset-0 !-z-10 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

          </div>
        )
        }
      </div>

      {/* <div className="!absolute !inset-0 w-full h-screen top-0 left-0 ">
        <GhostCursor
          className="absolute -z-10"
          // Visuals
          color="#B19EEF"
          brightness={1}
          edgeIntensity={0}
          // Trail and motion
          trailLength={50}
          inertia={0.5}
          // Post-processing
          grainIntensity={0.05}
          bloomStrength={0.1}
          bloomRadius={1.0}
          bloomThreshold={0.025}
          // Fade-out behavior
          fadeDelayMs={1000}
          fadeDurationMs={1500}
        />
      </div> */}

    </div>
  );
}
