-- Add status and accepted_at columns to organization_invitations table
-- This migration adds the status tracking system for invitations

-- Add status column with default value 'pending'
ALTER TABLE organization_invitations 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Add accepted_at column for tracking when invitation was accepted
ALTER TABLE organization_invitations 
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance on status
CREATE INDEX IF NOT EXISTS idx_organization_invitations_status 
ON organization_invitations(status);

-- Create index for queries filtering by organization and status
CREATE INDEX IF NOT EXISTS idx_organization_invitations_org_status 
ON organization_invitations(organization_id, status);

-- Update existing invitations to have 'pending' status if they don't expire yet
UPDATE organization_invitations 
SET status = 'pending' 
WHERE status IS NULL AND expires_at > NOW();

-- Update expired invitations to have 'expired' status
UPDATE organization_invitations 
SET status = 'expired' 
WHERE status IS NULL AND expires_at <= NOW();

-- Add check constraint to ensure status is one of the valid values
ALTER TABLE organization_invitations 
ADD CONSTRAINT IF NOT EXISTS chk_invitation_status 
CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled'));

-- Add comment explaining the status column
COMMENT ON COLUMN organization_invitations.status IS 'Status of the invitation: pending, accepted, declined, expired, cancelled';
COMMENT ON COLUMN organization_invitations.accepted_at IS 'Timestamp when the invitation was accepted';