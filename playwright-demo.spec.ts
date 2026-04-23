import { test, expect } from '@playwright/test';

test('demo checkout workflow', async ({ page }) => {
  console.log('Starting demo checkout workflow...');
  
  // Go to burgers page
  await page.goto('http://localhost:3000/burgers');
  console.log('Navigated to burgers page:', page.url());
  
  // Wait for and click "Add to Cart" on a burger
  const addToCartButton = page.getByRole('button', { name: /Add to Cart/i }).first();
  await expect(addToCartButton).toBeVisible({ timeout: 15000 });
  await addToCartButton.click();
  console.log('Clicked Add to Cart');
  
  // Navigate directly to checkout page
  await page.goto('http://localhost:3000/checkout');
  console.log('Navigated to checkout page:', page.url());
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'checkout-page.png' });
  
  if (page.url().includes('auth/login')) {
      console.error('Redirected to login page! Content:', await page.content());
      throw new Error('Redirected to login page instead of checkout');
  }

  // Wait for the checkout form to be visible
  await expect(page.locator('form')).toBeVisible({ timeout: 15000 });

  // Fill in checkout form using IDs found in the component
  await page.fill('#name', 'John Doe');
  await page.fill('#email', 'john.doe.' + Date.now() + '@example.com');
  await page.fill('#phone', '0712345678');
  
  // If delivery is selected, fill address
  const addressField = page.locator('#address');
  if (await addressField.isVisible()) {
      await addressField.fill('123 Test St, Nairobi');
  }
  
  // Select "Pay via Till"
  const payWithCashRadio = page.locator('#cash');
  await expect(payWithCashRadio).toBeVisible();
  await payWithCashRadio.click();
  console.log('Selected Pay via Till');

  // Submit order
  const placeOrderButton = page.getByRole('button', { name: /Place Order/i });
  await expect(placeOrderButton).toBeEnabled();
  await placeOrderButton.click();
  console.log('Clicked Place Order');
  
  // Verify success
  await expect(page).toHaveURL(/.*success/, { timeout: 20000 });
  console.log('Navigated to success page:', page.url());
  
  // Check for a success message
  const successMessage = page.getByText(/Order Placed Successfully/i);
  await expect(successMessage).toBeVisible({ timeout: 15000 });
  console.log('Success message visible');
});
