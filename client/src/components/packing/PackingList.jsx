import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  ProgressBar, 
  ListGroup, 
  InputGroup, 
  Badge, 
  Spinner,
  Alert // Added Alert import
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import packingListService from '../../services/packingListService';

const PackingList = ({ tripId, initialItems = [], isOwner }) => {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState('');
  const [progress, setProgress] = useState(0);
  const [packedCount, setPackedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState(null);

  // Calculate progress whenever items change
  useEffect(() => {
    if (items.length > 0) {
      const packedItems = items.filter(item => item.isPacked).length;
      setPackedCount(packedItems);
      setProgress(Math.round((packedItems / items.length) * 100));
    } else {
      setPackedCount(0);
      setProgress(0);
    }
  }, [items]);

  // Load packing list from the server
  const fetchPackingList = useCallback(async () => {
    if (!tripId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await packingListService.getPackingList(tripId);
      if (data && Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching packing list:', error);
      setError(error.response?.data?.msg || 'Failed to load packing list.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  // useEffect for initial load
  useEffect(() => {
    if (tripId && (initialItems === null || initialItems.length === 0)) {
      fetchPackingList();
    } else if (initialItems && Array.isArray(initialItems)) {
      setItems(initialItems);
      setIsLoading(false);
    } else {
      setItems([]);
      setIsLoading(false);
    }
  }, [tripId, initialItems, fetchPackingList]);

  // Handler for adding item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    if (!isOwner) {
      toast.info("Only the project owner can add packing items.");
      return;
    }

    setIsMutating(true);
    setError(null);
    try {
      const newItemObj = {
        item: newItem.trim(),
        isPacked: false
      };

      const updatedList = await packingListService.addPackingItem(tripId, newItemObj);
      setItems(updatedList);
      setNewItem('');
      toast.success('Item added successfully');
    } catch (err) {
      console.error('Error details:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to add item';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsMutating(false);
    }
  };

  // Handler for toggling item packed status
  const handleToggleItem = async (id) => {
    if (!isOwner) {
      toast.info("Only the project owner can update packing items.");
      return;
    }
    setIsMutating(true);
    setError(null);
    try {
      const updatedList = await packingListService.togglePackingItem(tripId, id);
      setItems(updatedList);
    } catch (err) {
      console.error('Error details:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to update item';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsMutating(false);
    }
  };

  // Handler for removing item
  const handleRemoveItem = async (id) => {
    if (!isOwner) {
      toast.info("Only the project owner can remove packing items.");
      return;
    }
    setIsMutating(true);
    setError(null);
    try {
      const updatedList = await packingListService.removePackingItem(tripId, id);
      setItems(updatedList);
      toast.success('Item removed successfully');
    } catch (err) {
      console.error('Error details:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to remove item';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header as="h5">Packing Checklist</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleAddItem}>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add an item..."
              aria-label="Add an item"
              disabled={isMutating || !isOwner}
            />
            <Button
              variant="primary"
              type="submit"
              disabled={isMutating || !newItem.trim() || !isOwner}
            >
              {isMutating ? 'Adding...' : 'Add'}
            </Button>
          </InputGroup>
          {!isOwner && <p className="text-muted small">Only the project owner can add items.</p>}
        </Form>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <span className="me-2">Packing Progress:</span>
              <Badge bg={progress === 100 ? 'success' : 'primary'}>
                {packedCount} of {items.length} items packed
              </Badge>
            </div>
            <span className="fw-bold">{progress}%</span>
          </div>
          <ProgressBar
            now={progress}
            variant={progress === 100 ? 'success' : 'primary'}
            striped={progress < 100}
            animated={progress < 100}
          />
        </div>

        {isLoading ? (
          <div className="text-center">
            <Spinner animation="border" size="sm" /> Loading list...
          </div>
        ) : items.length > 0 ? (
          <ListGroup variant="flush">
            {items.map((item, index) => (
              <ListGroup.Item
                key={item._id || `temp-${index}`}
                className="d-flex justify-content-between align-items-center"
              >
                <Form.Check
                  type="checkbox"
                  id={`item-${item._id || index}`}
                  label={item.item}
                  checked={item.isPacked}
                  onChange={() => handleToggleItem(item._id)}
                  className={item.isPacked ? 'text-decoration-line-through text-muted' : ''}
                  disabled={isMutating || !isOwner}
                />
                {isOwner && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveItem(item._id)}
                    disabled={isMutating}
                  >
                    ×
                  </Button>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted text-center">
            No items added yet. {isOwner ? 'Add items you need to pack!' : ''}
          </p>
        )}
      </Card.Body>
    </Card>
  );
};

export default PackingList;