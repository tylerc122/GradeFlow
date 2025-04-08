from datetime import datetime
import pytz

def convert_utc_to_timezone(utc_dt, timezone_str="UTC"):
    """
    Convert a UTC datetime to the user's timezone
    
    Args:
        utc_dt (datetime): The UTC datetime to convert
        timezone_str (str): The timezone to convert to (e.g., 'America/New_York')
        
    Returns:
        datetime: The converted datetime in the user's timezone
    """
    if not utc_dt:
        return None
        
    if not timezone_str or timezone_str == "UTC":
        return utc_dt
        
    try:
        # If the datetime is naive (no timezone info), assume it's UTC
        if utc_dt.tzinfo is None:
            utc_dt = utc_dt.replace(tzinfo=pytz.UTC)
            
        # Convert to the target timezone
        user_timezone = pytz.timezone(timezone_str)
        return utc_dt.astimezone(user_timezone)
    except Exception as e:
        print(f"Error converting timezone: {str(e)}")
        return utc_dt  # Return original if conversion fails

def format_datetime_for_response(utc_dt, timezone_str="UTC", include_timezone=True):
    """
    Format a UTC datetime for API response, converting to user's timezone
    
    Args:
        utc_dt (datetime): The UTC datetime to format
        timezone_str (str): The timezone to convert to
        include_timezone (bool): Whether to include timezone info in the result
        
    Returns:
        str: ISO formatted datetime string in the user's timezone
    """
    if not utc_dt:
        return None
        
    converted_dt = convert_utc_to_timezone(utc_dt, timezone_str)
    
    # Format with or without timezone info
    if include_timezone:
        return converted_dt.isoformat()
    else:
        # Format without 'Z' or timezone offset
        return converted_dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] 