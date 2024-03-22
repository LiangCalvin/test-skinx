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
  postedAt: string,
  postedBy: string
}

const MAX_CONTENT_LENGTH = 150; // Maximum number of characters to display initially

export default function LandingPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirect to login page if token is not found
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
          // Fetch data for the landing page
          fetch("http://localhost:3333/home", {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + token
            }
          })
            .then(res => res.json())
            .then(data => {
              setItems(data);
            })
            .catch(error => {
              console.error('Error fetching data:', error);
            });
        } else {
          alert('Authentication failed');
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
      })
      .catch(error => {
        console.error('Error:', error);
      })
  }, [])

  if (!authenticated) {
    // Show loading indicator or other UI while authentication is being checked
    return <div>Loading...
      <CircularProgress color="inherit" size={16} />
    </div>;

  }


  const toggleContentDisplay = (itemId: number) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Typography variant="h3" gutterBottom>
            Post
          </Typography>
          <Grid container spacing={2}>
            {items.map(item => (
              <Grid item key={item.id} xs={12} sm={4} >
                <Card sx={{ maxWidth: 345 }}>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      dangerouslySetInnerHTML={{
                        __html: expandedItems.includes(item.id) ? item.content : item.content.length > MAX_CONTENT_LENGTH ? `${item.content.substring(0, MAX_CONTENT_LENGTH)}...` : item.content
                      }}
                    />
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => toggleContentDisplay(item.id)}>
                      {expandedItems.includes(item.id) ? "Show Less" : "Show More"}
                    </Button>
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