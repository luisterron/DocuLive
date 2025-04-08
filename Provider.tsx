'use client';
import { ClientSideSuspense, LiveblocksProvider } from '@liveblocks/react/suspense';
import { ReactNode } from 'react';
import Loader from './components/ui/Loader';
import { getClerkUsers, getDocumentUsers } from './lib/actions/users.actions';
import { useUser } from '@clerk/nextjs';

const Provider = ({children}: {children:ReactNode}) => {
  const{user:clerkUser}=useUser();
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({ userIds }) => {
        try {
          const users = await getClerkUsers({ userIds });
          return users;
        } catch (error) {
          console.error("Error fetching users:", error);
          return []; // Return an empty array in case of an error, or handle appropriately
        }
      }}

      resolveMentionSuggestions={async({text,roomId})=>{
        const roomUsers=await getDocumentUsers({
          roomId,
          currentUser: clerkUser?.emailAddresses[0].emailAddress!,
          text
        });
        return roomUsers;
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>
        {children}
      </ClientSideSuspense>
    </LiveblocksProvider>
  );
}

export default Provider;
