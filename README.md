# Getting Started

🍗 Welcome to Lunchy: online food order split bill management.
This is the SAP CAP version of Lunchy.

📄 Spreadsheet Version (v1)
-- Launched May 28, 2025 --
Lunchy originally started as a simple spreadsheet designed to help a small team track food order costs and split delivery fees. What began as a quick solution turned out to be highly useful and was adopted regularly for group orders — proving the need for a more structured system.

☁️ SAP CAP Version (v2)
-- Still Under Development --
As part of our study and exploration of SAP CAP (Cloud Application Programming), we rebuilt Lunchy using the SAP CAP framework. This version enhances data validation, enables easier tracking of order history, supports role-based access and payment monitoring, and provides a scalable foundation for future improvements such as payment integration.

## Purpose
Lunchy is designed to help track lunch orders every workday — because ordering together is not only easier but also cheaper! 🤪
The main purpose of Lunchy is to organize the process of ordering food for a group of people and tracking the payments.

Purpose | Details
---------|----------
`Customer Management` | Managing participant names and the total number of people involved to ensure accurate cost distribution.
`Menu Documentation` | Recording the details of each food item ordered for clarity and verification.
`Cost Allocation` | Calculating and assigning costs to each customer based on their individual orders, including any discounts or fees.
`Order Summary` | Providing a consolidated overview of the total payment to validate it against the buyer’s actual expenses.
`Buyer Identification` | Identifying the individual responsible for placing and paying for the order to ensure accurate reimbursement.
`Payment Method Suggestion` | Recommending a preferred payment method to simplify and streamline the reimbursement process.
`Payment Tracking` | Monitoring individual payment statuses to identify who has or hasn’t completed their payment.

## CAP Version
Advantages:
- Supports validation rules for data accuracy
- Enables reliable tracking of ordered menu history for future reference
- Highly extendable for more complex features and future enhancements

Disadvantages:
- Less flexible for ad-hoc changes during 
- Requires an internet connection
- Needs ongoing maintenance and updates

## Activate
- Bash Terminal: `cds deploy`
- Bash Terminal: `cds watch`
- Open http://localhost:4004

## Collaborators
SAP Technical Consultants
- _Fahri: Lead Developer, Quality Controller, User_
https://github.com/fahrialmd
- _Clarice: Developer, Business Analyst, Main User_
https://github.com/clarice-silvanus

Special thanks to Ammar for initiating the creation of Lunchy (v1).
