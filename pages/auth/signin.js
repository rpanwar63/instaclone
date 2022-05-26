import { getProviders, signIn, useSession } from 'next-auth/react';
import Router from 'next/router';
import React from 'react'

function Signin({ providers }) {
  const { data: session} = useSession();
  if(session) Router.push('/Home');
  return (
    <div className='flex flex-col items-center justify-center h-screen space-y-10'>
        <img src="/logo.png" alt="logo" />
        {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button className='bg-blue-500 px-8 py-3 rounded-md text-white' onClick={() => signIn(provider.id, { callbackUrl: '/' })}>Log In with {provider.name}</button>
        </div>
      ))}
        
    </div>
  )
}

export async function getServerSideProps(){
    const providers = await getProviders();
    return {
        props: { providers }
    }
}

export default Signin