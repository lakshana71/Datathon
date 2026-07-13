# ----------------------------------------
# Incident Generation System (Simulation)
# ----------------------------------------

def generate_incident(event, context):

    # Extract log information
    log_group = event["detail"]["logGroup"]
    log_stream = event["detail"]["logStream"]
    log_message = event["detail"]["message"]

    # Create incident details
    incident_title = f"Anomaly Detected in Log Stream: {log_stream}"

    incident_description = (
        f"Anomaly detected in log group: {log_group}\n"
        f"Log message: {log_message}"
    )

    impact = 1
    urgency = 1
    severity = 1

    print("=" * 50)
    print("      INCIDENT MANAGEMENT SYSTEM")
    print("=" * 50)
    print(f"Title       : {incident_title}")
    print(f"Description : {incident_description}")
    print(f"Impact      : {impact}")
    print(f"Urgency     : {urgency}")
    print(f"Severity    : {severity}")
    print("\nIncident Created Successfully!")
    print("=" * 50)


# ----------------------------------------
# Sample Event
# ----------------------------------------

event = {
    "detail": {
        "logGroup": "ApplicationLogs",
        "logStream": "Server-01",
        "message": "CPU utilization exceeded 95%"
    }
}

generate_incident(event, None)from begining solly
