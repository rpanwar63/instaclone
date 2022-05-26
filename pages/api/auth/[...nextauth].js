import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from "../../../firebase";

export default NextAuth({
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
  ],
  pages: {
      signIn: '/auth/signin',
  },
  secret: process.env.GOOGLE_CLIENT_SECRET,
  callbacks: {
    async session({ session, token, user }) {
      session.user.username = session.user.name
      .split(" ")
      .join("")
      .toLocaleLowerCase();
      
      session.user.uid = token.sub;
      
      const userRef = collection(db, 'users');
      const docRef = doc(db, "users", token.sub);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(doc(userRef, token.sub), {
          ...session.user,
          posts: 0,
          followers: 0,
          following: 0,
          bio: '',
          saved: [],
        })
      }

      return session;
    }
  }
})