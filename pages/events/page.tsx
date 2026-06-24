'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { CheckIcon, CopyIcon, Edit } from 'lucide-react';
import { Loader } from '@/components/loader';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
// import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from 'react-daisyui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip';
import Mainsidebar from '@/components/ui/mainSideBar';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search } from 'lucide-react';
import CreateEvent from './create/page';
import {

  CopyPlusIcon,
  TrashIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import EditEvent from './update/index';
// import { Separator } from '@/components/ui/separator';
import UsernameSetup from '@/components/UsernameSetup';
import { ScrollArea } from '@/components/ui/scroll-area';
import CircularText from '@/components/ui/CircularTextLoader';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { ExternalLinkIcon } from '@/components/animate-ui/icons/external-link';
import { LinkIcon } from '@/components/animate-ui/icons/link';
import { Check } from '@/components/animate-ui/icons/check';
import { EllipsisIcon } from '@/components/animate-ui/icons/ellipsis';
import { Header } from '@/components/doc-components/Header';
import Image from 'next/image';
import BookingPage from "../[username]/[slug]";
import { Plus, PlusIcon } from '@/components/animate-ui/icons/plus';
import LazyLoader from '@/components/loader/lazyloader';


export default function Events() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState<boolean>(false);
  // const [open, setOpen] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState<{
    username: string;
    slug: string;
    event: any;
  } | null>(null);

   if (status === 'unauthenticated') {
    redirect('/auth/login');
  }
  const {
    data: events,
    isLoading,
    // data,
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch('/api/event/all');
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    enabled: !!session,
  });

  const togglePrivacyMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch('/api/event/toggle-privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      if (!response.ok) throw new Error('Failed to toggle privacy');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/event/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const handleOpenBooking = (event: any, username: string) => {
    // Don't open if event is private
    if (event.isPrivate) return;

    // Just set data and open modal - NO URL CHANGE
    setSelectedEventData({
      username,
      slug: event.slug,
      event: event
    });

    // Open the modal
    setIsBookingOpen(true);
  };

  // Handle closing booking modal
  const handleCloseBooking = (open: boolean) => {
    setIsBookingOpen(open);
    if (!open) {
      setSelectedEventData(null);
    }
  };



  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen dark:bg-black flex items-center justify-center">
       <LazyLoader/>
      </div>
    );
  }

  const handleCopy = async (event: any) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${events?.data?.username}/${event.slug}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleUserNameCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${events?.data?.username}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex w-full full max-h-screen dark:bg-[#0F0F0F] !overflow-hidden">
      <Mainsidebar />
      {events?.data?.events?.length > 0 ? (
        <ScrollArea className="flex w-full flex-col overflow-auto">
        <Header />
        <div className="w-full px-8 py-0 flex flex-wrap items-center justify-between bg-[#fff] dark:bg-[#090909] border-b dark:border-[#333]">

          <div className="flex items-center justify-between w-full py-0 ">
            <div className="relative">
              <Input
                className="peer pe-20 ps-8 dark:border-neutral-700 rounded-lg"
                placeholder="Search..."
                type="search"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search size={16} strokeWidth={2} />
              </div>
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Submit search"
                type="submit"
              >
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <div className="flex justify-center items-center gap-0">
              <CreateEvent>
                <Button
                  variant="outline"
                  size="sm"
                  className="aspect-square rounded-lg h-8 py-0 flex justify-center hover:dark:bg-white/80 text-center gap-1 items-center max-sm:p-0 text-sm bg-blue-600 text-white dark:bg-white dark:text-black"
                >
                  {/* <Plus className="opacity-1"
                    size={14}
                    aria-hidden="true" /> */}
                  <span className="max-sm:sr-only">New Event</span>
                </Button>
              </CreateEvent>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="outline"
                    className="bg-transparent rounded-md px-2 h-8 py-0 dark:border-[#323232]"
                    size="sm"
                  >
                    <AnimateIcon animateOnHover>
                      <EllipsisIcon
                        size={16}
                        className="shrink-0 text-muted-foreground/80"
                        aria-hidden="true"
                      />
                    </AnimateIcon>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuLabel>Events</DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <span>
                        <Link
                          href={`${window.location.origin}/${events.data.username}`}
                          className="text-[#004eba] flex justify-center gap-1 items-center text-center whitespace-nowrap 
                   overflow-hidden hover:underline truncate line-clamp-1 text-sm dark:text-gray-300"
                        >
                          <ExternalLink
                            size={17}
                            className="dark:text-blue-700"
                          />
                          <span className="">Booking Page</span>
                        </Link>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem aria-label={copied ? 'Copied' : 'Copy to clipboard'}
                      onClick={handleUserNameCopy}>
                      <span className='flex items-center gap-2'>
                        <div
                          className={cn(
                            ' absolute transition-all',
                            copied
                              ? 'scale-100 opacity-100 p-0'
                              : 'scale-0 opacity-0'
                          )}
                        >
                          <CheckIcon
                            className="stroke-emerald-500"
                            size={16}
                            aria-hidden="true"
                          />
                        </div>
                        <div
                          className={cn(
                            'transition-all',
                            copied
                              ? 'scale-0 opacity-0 p-0'
                              : 'scale-100 opacity-100'
                          )}
                        >
                          <CopyIcon size={16} aria-hidden="true" />
                        </div>
                        Copy Url
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>


                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setShowUsernameModal(true)}>
                    <span>Set UserName</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        

      <div className="w-full overflow-hidden px-8 py-6">
  <Card className="overflow-hidden rounded-2xl border dark:border-[#333] dark:bg-[#191919] shadow-sm ">
    <table className="w-full">
      <tbody className="divide-y dark:divide-[#323232]">
        {events.data.events.map((event: any) => (
          <tr
            key={event.id}
            className={cn(
              event.isPrivate && 'bg-transparent'
            )}
          >
            {/* Event details cell */}
            <td className="p-3 px-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-end">
                  <h2
                    className={cn(
                      `text-md font-semibold dark:text-neutral-300`,
                      event.isPrivate && 'text-[rgba(109,107,107,0.61)]'
                    )}
                  >
                    {event.title}/
                    <span className="text-xs font-sans font-medium text-[#A3A3A3]">
                      {event.slug.replace(/-([a-z])/g, (_, c) =>
                        c.toUpperCase()
                      )}{' '}
                      • {event._count.meetings} bookings
                    </span>
                  </h2>
                </div>
                <span className="dark:text-[#ffffff] text-xs border dark:border-[#343434] flex items-center px-1 gap-1 rounded-sm w-fit dark:bg-[#222]">
                  <Clock className="h-3 w-3 dark:text-[#B9B9B9]" /> <p className="dark:text-[#ffffff] text-xs font-medium">{event.duration}m</p>
                </span>
              </div>
            </td>

            {/* Actions cell */}
            <td className="p-3 px-5">
              <div className="flex items-center justify-end gap-4">
                <Badge className="dark:bg-[#323232] text-xs px-0.5 rounded-sm font-semibold">
                  {event.isPending ? (
                    <Loader size="sm" color="black" /> 
                  ) : (
                    <span>{event.isPrivate ? 'Hidden' : ''}</span>
                  )}
                </Badge>

                <Switch
                className='dark:bg-[#fff]'
                 
                  checked={event.isPrivate}
                  onCheckedChange={() =>
                    togglePrivacyMutation.mutate(event.id)
                  }
                  disabled={togglePrivacyMutation.isPending}
                />

                <div className="flex items-center dark:bg-[#232323] rounded-xl border dark:border-[#393939]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className=''>
                        <AnimateIcon animateOnHover>
                          <Button
                            onClick={() => handleOpenBooking(event, events.data.username)}
                            variant="ghost"
                            className='dark:hover:bg-[#111] rounded-l-xl rounded-r-none'
                            size="icon"
                            disabled={event.isPrivate}
                          >
                            <ExternalLinkIcon className="h-4 w-4 dark:text-[#CBCBCB]" />
                          </Button>
                        </AnimateIcon>
                      </TooltipTrigger>
                      <TooltipContent className="px-2 py-1 text-xs">
                        View booking page
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="dark:bg-[#444] bg-neutral-300 h-9 w-[1px]" />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AnimateIcon animateOnHover>
                          <Button
                            size="icon"
                            className="disabled:opacity-100 dark:text-[#CBCBCB] dark:hover:bg-[#111] rounded-none"
                            onClick={() => handleCopy(event)}
                            aria-label={copied ? 'Copied' : 'Copy to clipboard'}
                            disabled={event.isPrivate}
                            variant="ghost"
                          >
                            <div
                              className={cn(
                                'absolute transition-all',
                                copied
                                  ? 'scale-100 opacity-100'
                                  : 'scale-0 opacity-0'
                              )}
                            >
                              <Check
                                className="stroke-emerald-500"
                                size={16}
                                aria-hidden="true"
                              />
                            </div>
                            <div
                              className={cn(
                                'transition-all',
                                copied
                                  ? 'scale-0 opacity-0'
                                  : 'scale-100 opacity-100'
                              )}
                            >
                              <LinkIcon />
                            </div>
                          </Button>
                        </AnimateIcon>
                      </TooltipTrigger>
                      <TooltipContent className="px-2 py-1 text-xs">
                        Click to copy
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="dark:bg-[#444] bg-neutral-300 h-9 w-[1px]" />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className='dark:hover:bg-[#111] rounded-l-none rounded-r-xl'>
                              <AnimateIcon animateOnHover>
                                <EllipsisIcon className="dark:text-[#CBCBCB]" />
                              </AnimateIcon>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Edit</DropdownMenuLabel>
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => handleCopy(event)}>
                                <CopyPlusIcon
                                  size={16}
                                  className="opacity-60"
                                  aria-hidden="true"
                                />
                                Copy
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(event)}>
                                <Edit
                                  size={16}
                                  className="opacity-60"
                                  aria-hidden="true"
                                />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => deleteEventMutation.mutate(event.id)}
                                disabled={deleteEventMutation.isPending}
                              >
                                <TrashIcon size={16} aria-hidden="true" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipTrigger>
                      <TooltipContent className="px-2 py-1 text-xs">
                        More options
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
</div>


      </ScrollArea>
      ) : (
        <div className="flex justify-center items-center h-screen max-h-[70%] w-full  relative">
          <div
            className="flex flex-col items-center justify-center
               h-full w-full text-center z-50"
          >
            <Image
              src="https://img.freepik.com/free-vector/date-picker-concept-illustration_114360-4495.jpg?t=st=1751978834~exp=1751982434~hmac=59e640f90ce63422b604bc75a4903ea45721e72af87ae5bfa38bf15b4dd016d3&w=2000"
              alt={'Create events'}
              className="w-auto rounded-md h-[150px] mb-3"
              height={1000}
              width={1000}
            />

            <p className="text-zinc-400 font-medium mb-1">No Scheduling event yet</p>

            <p className="text-zinc-600 text-sm">Create event for schedule meetings with team</p>
            <div className="mt-2">
              <CreateEvent>
                <AnimateIcon animateOnHover>
                  <Button
                    variant="outline"
                    size="sm"
                    // onClick={() => setIsOpen(true)}
                    className="aspect-square flex justify-center text-center items-center max-sm:p-0 text-sm bg-yellow-500 dark:bg-blue-700 text-white"
                  >
                    <PlusIcon className="opacity-1"
                      size={16}
                      aria-hidden="true" />
                    <span className="max-sm:sr-only">Create Event</span>
                  </Button>

                </AnimateIcon>
              </CreateEvent>
            </div>
          </div>
          <div className="absolute inset-0 z-10 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

        </div>
      )}

      <UsernameSetup
        open={showUsernameModal}
        onOpenChange={setShowUsernameModal}
      />
      <EditEvent
        event={selectedEvent as any}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
      {selectedEventData && (
        <BookingPage
          externalOpen={isBookingOpen}
          onOpenChange={handleCloseBooking}
          username={selectedEventData.username}
          slug={selectedEventData.slug}
          eventData={selectedEventData.event}
        />
      )}
    </div>
  );
}
