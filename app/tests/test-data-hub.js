describe('DataHub', () => {
    let mockFetch;
    
    beforeEach(() => {
        // Mock fetch API
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        
        // Reset DOM
        document.body.innerHTML = `
            <div id="inventory-table"></div>
            <div id="orders-table"></div>
            <div id="suppliers-table"></div>
            <div id="error-message"></div>
            <canvas id="inventory-chart"></canvas>
            <canvas id="orders-chart"></canvas>
        `;
        
        // Reset DataHub state
        DataHub.state = {
            inventory: [],
            orders: [],
            suppliers: [],
            analytics: {}
        };
    });

    describe('Initialization', () => {
        test('should initialize successfully', async () => {
            const mockData = {
                inventory: [{ id: 1, name: 'Test Item', quantity: 10, unit: 'kg', status: 'in_stock' }],
                orders: [{ id: 1, status: 'pending', total_amount: 100 }],
                suppliers: [{ id: 1, name: 'Test Supplier', rating: 4.5, status: 'active' }]
            };

            mockFetch
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData.inventory) })
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData.orders) })
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData.suppliers) });

            await DataHub.init();

            expect(DataHub.state.inventory).toEqual(mockData.inventory);
            expect(DataHub.state.orders).toEqual(mockData.orders);
            expect(DataHub.state.suppliers).toEqual(mockData.suppliers);
        });

        test('should handle initialization errors', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            await DataHub.init();

            const errorDiv = document.getElementById('error-message');
            expect(errorDiv.textContent).toContain('Failed to initialize');
            expect(errorDiv.style.display).toBe('block');
        });
    });

    describe('Data Management', () => {
        test('should update inventory section', () => {
            DataHub.state.inventory = [
                { id: 1, name: 'Test Item', quantity: 10, unit: 'kg', status: 'in_stock' }
            ];

            DataHub.updateInventorySection();

            const inventoryTable = document.getElementById('inventory-table');
            expect(inventoryTable.innerHTML).toContain('Test Item');
            expect(inventoryTable.innerHTML).toContain('10 kg');
            expect(inventoryTable.innerHTML).toContain('in_stock');
        });

        test('should update orders section', () => {
            DataHub.state.orders = [
                { id: 1, status: 'pending', total_amount: 100 }
            ];

            DataHub.updateOrdersSection();

            const ordersTable = document.getElementById('orders-table');
            expect(ordersTable.innerHTML).toContain('pending');
            expect(ordersTable.innerHTML).toContain('$100.00');
        });

        test('should update suppliers section', () => {
            DataHub.state.suppliers = [
                { id: 1, name: 'Test Supplier', rating: 4.5, status: 'active' }
            ];

            DataHub.updateSuppliersSection();

            const suppliersTable = document.getElementById('suppliers-table');
            expect(suppliersTable.innerHTML).toContain('Test Supplier');
            expect(suppliersTable.innerHTML).toContain('4.5');
            expect(suppliersTable.innerHTML).toContain('active');
        });
    });

    describe('Form Handling', () => {
        test('should handle inventory form submission', async () => {
            const form = document.createElement('form');
            form.id = 'inventory-form';
            document.body.appendChild(form);

            const formData = {
                name: 'New Item',
                quantity: '20',
                unit: 'kg'
            };

            mockFetch.mockResolvedValueOnce({ ok: true });

            const event = {
                preventDefault: jest.fn(),
                target: form
            };

            form.reset = jest.fn();

            await DataHub.handleInventoryForm(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockFetch).toHaveBeenCalledWith('/api/inventory', expect.any(Object));
            expect(form.reset).toHaveBeenCalled();
        });

        test('should handle form submission errors', async () => {
            const form = document.createElement('form');
            form.id = 'inventory-form';
            document.body.appendChild(form);

            mockFetch.mockResolvedValueOnce({ ok: false });

            const event = {
                preventDefault: jest.fn(),
                target: form
            };

            await DataHub.handleInventoryForm(event);

            const errorDiv = document.getElementById('error-message');
            expect(errorDiv.textContent).toContain('Failed to update inventory');
            expect(errorDiv.style.display).toBe('block');
        });
    });

    describe('Utility Functions', () => {
        test('should format date correctly', () => {
            const date = new Date('2024-03-15');
            const formatted = DataHub.formatDate(date);
            expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
        });

        test('should format currency correctly', () => {
            const amount = 1234.56;
            const formatted = DataHub.formatCurrency(amount);
            expect(formatted).toBe('$1,234.56');
        });
    });
}); 