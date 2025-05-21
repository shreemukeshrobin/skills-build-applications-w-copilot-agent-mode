from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Deal
from django.urls import reverse

class DealModelTests(TestCase):

    def test_create_deal_successful(self):
        """Test creating a Deal instance with all fields."""
        now = timezone.now()
        deal = Deal.objects.create(
            name="Test Deal",
            description="A description for the test deal.",
            status="active",
            assigned_to_user_id=1,
            value=1000.00
        )
        self.assertEqual(deal.name, "Test Deal")
        self.assertEqual(deal.description, "A description for the test deal.")
        self.assertEqual(deal.status, "active")
        self.assertEqual(deal.assigned_to_user_id, 1)
        self.assertEqual(deal.value, 1000.00)
        self.assertTrue(deal.creation_date is not None)
        self.assertTrue(deal.last_updated is not None)
        # Check if creation_date is recent (within a small delta, e.g., 5 seconds)
        self.assertTrue((now - deal.creation_date).total_seconds() < 5)

    def test_deal_status_default(self):
        """Test that the default status for a new deal is 'active'."""
        deal = Deal.objects.create(
            name="Default Status Deal",
            assigned_to_user_id=2,
            value=500.00
        )
        self.assertEqual(deal.status, "active")

    def test_deal_timestamps_auto_set(self):
        """Test that creation_date and last_updated are automatically set."""
        deal = Deal.objects.create(
            name="Timestamp Deal",
            assigned_to_user_id=3,
            value=250.00
        )
        self.assertIsNotNone(deal.creation_date)
        self.assertIsNotNone(deal.last_updated)

        # Check that last_updated is greater than or equal to creation_date
        self.assertGreaterEqual(deal.last_updated, deal.creation_date)

        # Save the deal again and check if last_updated changes
        old_last_updated = deal.last_updated
        # To ensure time difference for last_updated
        import time
        time.sleep(0.01) # sleep for 10ms
        deal.description = "Updated description"
        deal.save()
        deal.refresh_from_db() # Reload the object from the database
        self.assertGreater(deal.last_updated, old_last_updated)

    def __str__(self):
        return f"{self.name} (Model Test)"


class DealAPITests(APITestCase):
    def setUp(self):
        self.deal1 = Deal.objects.create(name="Deal 1 Active User 1", status="active", assigned_to_user_id=1, value=100)
        self.deal2 = Deal.objects.create(name="Deal 2 Inactive User 2", status="inactive", assigned_to_user_id=2, value=200)
        self.deal3 = Deal.objects.create(name="Deal 3 Archived User 1", status="archived", assigned_to_user_id=1, value=300)
        self.deal4 = Deal.objects.create(name="Deal 4 Active User 3", status="active", assigned_to_user_id=3, value=400)

        self.list_create_url = reverse('deal-list') # Assuming your router setup uses 'deal-list'

    def get_detail_url(self, deal_id):
        return reverse('deal-detail', kwargs={'pk': deal_id}) # Assuming 'deal-detail'

    def test_get_all_deals(self):
        """Test GET /api/deals/ to retrieve all deals."""
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)

    def test_create_deal_api(self):
        """Test POST /api/deals/ to create a new deal."""
        data = {
            "name": "New API Deal",
            "description": "Created via API",
            "status": "active",
            "assigned_to_user_id": 2,
            "value": 1500.50
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Deal.objects.count(), 5)
        new_deal = Deal.objects.get(name="New API Deal")
        self.assertEqual(new_deal.value, 1500.50)

    def test_get_single_deal(self):
        """Test GET /api/deals/{id}/ to retrieve a single deal."""
        response = self.client.get(self.get_detail_url(self.deal1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.deal1.name)

    def test_update_deal_put(self):
        """Test PUT /api/deals/{id}/ to update a deal."""
        data = {
            "name": "Updated Deal 1 Name",
            "description": self.deal1.description, # PUT requires all fields
            "status": "inactive",
            "assigned_to_user_id": self.deal1.assigned_to_user_id,
            "value": self.deal1.value
        }
        response = self.client.put(self.get_detail_url(self.deal1.id), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.deal1.refresh_from_db()
        self.assertEqual(self.deal1.name, "Updated Deal 1 Name")
        self.assertEqual(self.deal1.status, "inactive")

    def test_delete_deal(self):
        """Test DELETE /api/deals/{id}/ to delete a deal."""
        response = self.client.delete(self.get_detail_url(self.deal2.id))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Deal.objects.count(), 3)
        with self.assertRaises(Deal.DoesNotExist):
            Deal.objects.get(id=self.deal2.id)

    def test_filter_deals_by_status(self):
        """Test GET /api/deals/?status=active to filter deals by status."""
        response = self.client.get(self.list_create_url, {'status': 'active'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        for deal_data in response.data:
            self.assertEqual(deal_data['status'], 'active')

    def test_filter_deals_by_assigned_user(self):
        """Test GET /api/deals/?assigned_to_user_id=1 to filter deals by user."""
        response = self.client.get(self.list_create_url, {'assigned_to_user_id': 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        for deal_data in response.data:
            self.assertEqual(deal_data['assigned_to_user_id'], 1)

    def test_create_deal_invalid_data(self):
        """Test POST /api/deals/ with invalid data (missing name)."""
        data = {
            "description": "Missing name deal",
            "status": "active",
            "assigned_to_user_id": 5,
            "value": 100.00
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data) # Check that 'name' is the field causing error

    def test_create_deal_invalid_status_choice(self):
        """Test POST /api/deals/ with invalid status choice."""
        data = {
            "name": "Invalid Status Deal",
            "description": "Trying to set a non-existent status",
            "status": "pending_approval", # Not a valid choice
            "assigned_to_user_id": 1,
            "value": 200.00
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)
        self.assertIn('"pending_approval" is not a valid choice.', str(response.data['status']))

    def __str__(self):
        return "Deal API Test Suite"
