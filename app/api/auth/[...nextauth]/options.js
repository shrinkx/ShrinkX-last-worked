import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';

export const authOptions = {
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],

	callbacks: {
		async signIn({ user }) {
			const client = await clientPromise;
			const db = client.db('shrinkx');
			const usersCollection = db.collection('users');

			await usersCollection.updateOne(
				{ email: user.email },
				{
					$setOnInsert: {
						name: user.name,
						email: user.email,
					}
				},
				{ upsert: true }
			);

			return true;
		},
	},

	session: {
		strategy: 'jwt',
	},

	secret: process.env.NEXTAUTH_SECRET,
};
