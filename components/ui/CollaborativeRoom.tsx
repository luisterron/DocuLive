'use client';

import { ClientSideSuspense, RoomProvider } from "@liveblocks/react";
import { Editor } from '@/components/editor/Editor'
import Header from '@/components/ui/Header'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import ActiveCollaborators from "./ActiveCollaborators";
import { useEffect, useRef, useState } from "react";
import { Input } from "./input";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/room.actions";
import Loader from "./Loader";
import ShareModal from "./ShareModal";

const CollaborativeRoom = ({roomId, roomMetadata,users,currentUserType}:CollaborativeRoomProps) => {

  const [editing,setEditing]= useState(false);
  const [loading,setLoading]=useState(false);
  const [documentTitle,setDocumentTitle]=useState(roomMetadata.title);

  const updateTitleHandler= async(e: React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key==="Enter"){
      setLoading(true);
      try {
        if(documentTitle !=roomMetadata.title){
          const updatedDocument= await updateDocument(roomId,documentTitle);

          if(updatedDocument){
            setEditing(false);
          }

        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    }
  }

  useEffect(()=>{
    const handleClickOutside=(e:MouseEvent)=>{
      if(containerRef.current && !containerRef.current.contains(e.target as Node)){
        setEditing(false);
        updateDocument(roomId,documentTitle);
      }
    }
    document.addEventListener('mousedown',handleClickOutside);
    return ()=>{
      document.removeEventListener('mousedown',handleClickOutside);
    }
  },[roomId,documentTitle]);

  useEffect(()=>{
    if(editing && inputRef.current){
      inputRef.current.focus();
    }
  },[editing])

  const containerRef=useRef<HTMLDivElement>(null);
  const inputRef=useRef<HTMLDivElement>(null);


  return (
    <RoomProvider id={roomId}>
    <ClientSideSuspense fallback={<Loader/>}>
        <div className="collaborative-room">
            <Header>
            <div ref={containerRef} className='w-fit justify-center gap-2 items-center flex' >
              {editing && !loading ?(
                <Input
                type="text"
                ref={inputRef}
                value={documentTitle}
                placeholder="Enter Title"
                onChange={(e)=>setDocumentTitle(e.target.value)}
                onKeyDown={updateTitleHandler}
                disabled={!editing}
                className="document-title-input" 
                />
              ):(
                <>
                  <p className='document-title'>{documentTitle}</p>
                </>
              )}

              {currentUserType ==='editor' && !editing &&(
                <Image
                src='/assets/icons/edit.svg'
                alt='edit'
                width={24}
                height={24}
                onClick={()=>setEditing(true)}
                className="pointer"
                />
              )}

              {currentUserType !=='editor' && !editing &&(
                <p className="view-only-tag">
                  View only
                </p>
              )}

              {loading && <p className="text-sm text-gray-400">saving...</p>}

            </div>
            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
              <ActiveCollaborators/>
              <ShareModal
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}
              />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
        </Header>
        <Editor roomId={roomId} currentUserType={currentUserType}/>
        </div>
    </ClientSideSuspense>
  </RoomProvider>
  )
}

export default CollaborativeRoom
