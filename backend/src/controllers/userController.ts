import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../services/PrismaServce.js';
import { UserMapper } from '../mappers/UserMapper.js';

export class UserController {
	constructor(private readonly prisma: PrismaService) {}

	public async getUser(request: Request, response: Response, next: NextFunction): Promise<void> {
		
		try {
			const user = await this.prisma.user.findUnique({
				where: { email: request.params.email as string },
			});

			if (!user) {
				response.status(404).json({ error: 'User not found' });
				return;
			}

			const usersWithAvatar = UserMapper.fromPrisma(user);

			response.json({
				success: true,
				data: usersWithAvatar
			});
		} catch (error) {
			next(error);
		}
	}

	public async createUser(request: Request, response: Response, _next: NextFunction) {
		console.log('Request body:', request.body); // Log the request body for debugging
		response.status(200).json({ message: 'User creation endpoint hit', body: request.body }); // Temporary response for debugging
		// const result = createUserSchema.safeParse(request.body);

		// if (!result.success) {
		// 	response.status(400).json({
		// 		error: 'Invalid request body',
		// 		issues: result.error.issues,
		// 	});
		// 	return;
		// }

		// try {
		// 	const user = await this.prisma.user.create({ data: result.data });
		// 	response.status(201).json({ data: user });
		// } catch (error) {
		// 	next(error);
		// }
	}
}