# Configurable Contract Implementation Guide

## Overview
This implementation adds a configurable contract system where each client can have their own contract template. Contracts can be created using either a PDF upload with field mapping or a text editor with dynamic field insertion. The system supports digital signatures for both installer and client.

## Database Structure

### Tables Created:
1. **contracts** - Stores contract templates
   - `client_id` - Associated client
   - `type` - 'pdf' or 'text'
   - `pdf_path` - Path to uploaded PDF (if type is PDF)
   - `content` - Text content (if type is text)
   - `field_mappings` - JSON field mappings for PDF forms
   - `signature_fields` - JSON signature field positions

2. **contract_signatures** - Stores signed contracts
   - `budget_id` - Associated budget
   - `contract_id` - Contract template used
   - `installer_signature` - Base64 signature image
   - `client_signature` - Base64 signature image
   - `pdf_path` - Generated signed contract PDF

## Implementation Steps

### 1. Run Migrations
```bash
php artisan migrate --path=database/migrations/tenant
```

### 2. Access Contract Management

#### For Clients:
- Navigate to Client View → "Contratos" section → "Gestionar Contratos"
- Route: `/contracts/{client_id}`

#### For Budgets:
- After a budget is accepted (status = 1), a contract signing icon appears in Budget List
- Route: `/contracts/{client_id}/budget/{budget_id}`

### 3. Create Contract Template

#### Option A: Text Editor
1. Go to Contracts → Create
2. Select "Editor de Texto"
3. Write contract content
4. Use "Campos Disponibles" tab to insert dynamic fields like `{{client.company_name}}`, `{{budget.id}}`, etc.
5. Fields are automatically replaced with actual data when contract is generated

#### Option B: PDF Upload
1. Go to Contracts → Create
2. Select "Subir PDF"
3. Upload PDF file
4. Configure field mappings (requires PDF form field extraction - advanced feature)

### 4. Sign Contract for Budget

1. Navigate to Budget List
2. Click contract icon for accepted budgets (status = 1)
3. Review contract (text preview or PDF view)
4. Installer signs using signature pad
5. Client signs using signature pad
6. Save signatures
7. When both signatures are present, PDF is automatically generated
8. Download signed contract PDF

## Available Dynamic Fields

The following fields can be used in text contracts:

### Client Fields:
- `{{client.company_name}}` - Company name
- `{{client.contact_name}}` - Contact name
- `{{client.email}}` - Email
- `{{client.phone}}` - Phone
- `{{client.address}}` - Address
- `{{client.city}}` - City
- `{{client.postal_code}}` - Postal code
- `{{client.province}}` - Province
- `{{client.country}}` - Country
- `{{client.cif}}` - CIF/NIF

### Budget Fields:
- `{{budget.id}}` - Budget ID
- `{{budget.created_at}}` - Budget creation date
- `{{budget.products_txt}}` - Products description
- `{{budget.total_price}}` - Total price

### Date Fields:
- `{{date.today}}` - Today's date
- `{{date.formatted}}` - Formatted date

## Files Created/Modified

### Models:
- `app/Models/Tenant/Contract.php`
- `app/Models/Tenant/ContractSignature.php`
- `app/Models/Tenant/Budget.php` (added relationship)

### Controllers:
- `app/Http/Controllers/Tenant/ContractController.php`

### Migrations:
- `database/migrations/tenant/2025_01_20_000001_create_contracts_table.php`
- `database/migrations/tenant/2025_01_20_000002_create_contract_signatures_table.php`

### Views (React):
- `resources/js/Pages/Tenant/Contracts/ContractList.jsx`
- `resources/js/Pages/Tenant/Contracts/ContractForm.jsx`
- `resources/js/Pages/Tenant/Contracts/ContractSign.jsx`

### Components:
- `resources/js/Template/Components/SignatureCapture/index.jsx`

### Blade Templates:
- `resources/views/contracts/text.blade.php`

### Routes:
- Added to `routes/tenant/main.php`

## Usage Flow

1. **Setup Contract Template** (One-time per client):
   - Client View → Contratos → Create
   - Choose PDF or Text editor
   - Configure fields
   - Save

2. **Budget Acceptance**:
   - Budget is accepted (status changes to 1)
   - Contract signing becomes available

3. **Sign Contract**:
   - Budget List → Click contract icon
   - Review contract
   - Installer signs
   - Client signs
   - System generates signed PDF

4. **Download Contract**:
   - After both signatures are saved
   - Download button appears
   - Download signed PDF

## Features

✅ Text-based contract editor with field insertion
✅ PDF upload support (basic - field mapping requires additional library)
✅ Digital signature capture (canvas-based)
✅ Automatic field replacement from budget/client data
✅ PDF generation with signatures
✅ Contract management per client
✅ Integration with budget workflow

## Future Enhancements

1. **PDF Field Mapping**:
   - Integrate PDF form field extraction library (e.g., setasign/fpdi)
   - Visual PDF field mapping interface
   - Auto-fill PDF form fields

2. **Advanced Features**:
   - Email contract to client for signing
   - Contract templates library
   - Version control for contracts
   - Contract approval workflow
   - E-signature integration (DocuSign, etc.)

3. **UI Improvements**:
   - Rich text editor for contracts
   - Drag-and-drop field insertion
   - Contract preview before signing
   - Mobile-optimized signature capture

## Notes

- Signature images are stored as base64 in database (consider moving to file storage for large contracts)
- PDF generation uses DomPDF (already installed)
- Contract templates are client-specific
- Only active contracts can be used for signing
- Contracts are automatically associated with accepted budgets

