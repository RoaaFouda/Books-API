import { PrismaClient } from './generated/prisma';
const prisma = new PrismaClient({log: ["query"]});
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// Create a new book
app.post('/api/v1/books', async (req: Request, res: Response) => {
    try {
        const { title, description, year, name } = req.body;
        const book = await prisma.book.create({
            data: {
                title,
                description,
                year,
                author: {
                    create: { name }
                }
            },
        });
        res.json({ message: "success", data: book });
    } catch (error) {
        console.error("Error creating book:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get single book by ID
app.get('/api/v1/books/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const book = await prisma.book.findUnique({
            where: { id: String(id) }
        });
        if (!book) {
            res.status(404).json({ message: "Book not found" });
        }
        res.json({ message: "success", data: book });
    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



// Get all books
app.get('/api/v1/books', async (req: Request, res: Response) => {
    try {
        const {search, year, page, limit, select} = req.query;
        
        const where: any = {};
        if (search) {
            where.title = { contains: String(search), mode: 'insensitive' };
        }
        if (year) {
            where.year = Number(year);
        }

    
        const pageNumber = Number(page);
        const pageSize = Number(limit);
        const skip = (pageNumber - 1) * pageSize;

        
        let selectObj: any;
        if (select) {
            selectObj = {};
             String(select).split(',').forEach(field => {
            selectObj[field.trim()] = true;
            });
        }

     
        const books = await prisma.book.findMany({
            where,
            skip,
            take: pageSize,
            ...(selectObj && { select: selectObj })
        });

        res.json({ message: "success", data: books });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Update a book by ID
app.put('/api/v1/books/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {title, description, year} = req.body;

        const newData: Record<string, any> = {};

        if(title) newData.title = title;
        if(description) newData.description = description;
        if(year) newData.year = year;

        await prisma.book.update({
            where: { 
                id: String(id) 
            },
            data: newData
        });
        res.json({ message: "Book updated successfully" });
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Delete a book by ID
app.delete('/api/v1/books/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.book.delete({
            where: { id: String(id) }
        });
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start the server
app.listen(4000, () => {
    console.log('Express server is running on port 4000');
});
