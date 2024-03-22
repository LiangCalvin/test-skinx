import * as React from 'react';
import { useEffect, useState } from 'react';
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';
import Navbar from './Navbar';

interface Item {
    id: number;
    title: string;
    content: string;
    postedAt: string;
    postedBy: string;
}

const MAX_CONTENT_LENGTH = 100; // Maximum number of characters to display initially

export default function LandingPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]); // State to hold filtered items
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        fetch("http://localhost:3333/auth", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
            .then(res => res.json())
            .then((data) => {
                if (data.status === 'ok') {
                    setAuthenticated(true);
                    fetch("http://localhost:3333/home", {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    })
                        .then(res => res.json())
                        .then(data => {
                            setItems(data);
                            setFilteredItems(data); // Initialize filteredItems with all items
                        })
                        .catch(error => {
                            console.error('Error fetching data:', error);
                        });
                } else {
                    alert('Authentication failed');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    useEffect(() => {
        // Filter items based on search query
        const filtered = items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
        setFilteredItems(filtered);
    }, [searchQuery, items]);

    if (!authenticated) {
        return (
            <div>Loading...
                <CircularProgress color="inherit" size={16} />
            </div>
        );
    }
    interface NavbarProps {
        onSearch: (searchQuery: string) => void; // Define onSearch prop as a function that takes a search query string
    }

    const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
        const [searchQuery, setSearchQuery] = useState<string>('');

        const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(event.target.value);
        };

        const handleSearchSubmit = () => {
            // Call the onSearch prop with the current search query
            onSearch(searchQuery);
        };

        return (
            <React.Fragment>
                <CssBaseline />
                <Container maxWidth="lg">
                    <Box sx={{ flexGrow: 1 }}>
                        <Navbar onSearch={(searchQuery: string) => {
                            // Implement your search functionality here
                            console.log('Search query:', searchQuery);
                        }} />          <Typography variant="h3" gutterBottom>
                            Post
                        </Typography>
                        <Grid container spacing={2}>
                            {filteredItems.map(item => (
                                <Grid item key={item.id} xs={12} sm={4} >
                                    <Card sx={{ maxWidth: 345 }}>
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="div">
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.content.substring(0, MAX_CONTENT_LENGTH)}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button size="small">Share</Button>
                                            <Button size="small">Learn More</Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </React.Fragment>
        );
    }
}